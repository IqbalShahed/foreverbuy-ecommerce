import { GoogleGenAI } from "@google/genai";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

const FAQ_RESPONSES = {
    shipping: "We usually deliver within 3 to 5 business days.",
    return: "You can return eligible items within 7 days of delivery.",
    refund: "Refunds are processed after the returned item passes inspection.",
    payment: "We currently support Cash on Delivery Only. Stripe will enable in future.",
    exchange: "Eligible products can be exchanged within 7 days, subject to stock availability.",
};

const COLOR_WORDS = [
    "black", "white", "blue", "red", "green", "yellow", "pink", "brown",
    "grey", "gray", "orange", "purple", "navy", "beige"
];

const CATEGORY_HINTS = {
    man: "Men",
    men: "Men",
    mens: "Men",
    male: "Men",
    gentleman: "Men",
    gentlemen: "Men",
    gent: "Men",
    gents: "Men",
    women: "Women",
    womens: "Women",
    woman: "Women",
    female: "Women",
    lady: "Women",
    ladies: "Women",
    kids: "Kids",
    kid: "Kids",
    child: "Kids",
    children: "Kids",
    boys: "Kids",
    girls: "Kids",
};

const SUBCATEGORY_HINTS = {
    tshirt: "Topwear",
    "t-shirt": "Topwear",
    topwear: "Topwear",
    topware: "Topwear",
    "top ware": "Topwear",
    bottom: "Bottomwear",
    bottoms: "Bottomwear",
    bottomwear: "Bottomwear",
    bottomware: "Bottomwear",
    "bottom wear": "Bottomwear",
    shirt: "Topwear",
    top: "Topwear",
    tee: "Topwear",
    tees: "Topwear",
    hoodie: "Winterwear",
    jacket: "Winterwear",
    sweater: "Winterwear",
    coat: "Winterwear",
    coats: "Winterwear",
    trouser: "Bottomwear",
    trousers: "Bottomwear",
    pant: "Bottomwear",
    pants: "Bottomwear",
    jeans: "Bottomwear",
    jogger: "Bottomwear",
    joggers: "Bottomwear",
    short: "Bottomwear",
    shorts: "Bottomwear",
    skirt: "Bottomwear",
    skirts: "Bottomwear",
    palazzo: "Bottomwear",
};

const INTENT_KEYWORDS = {
    recommend: ["recommend", "suggest", "best for me", "what should i buy", "show me products", "give me some", "give me products"],
    order: ["order", "delivery", "shipped", "tracking", "my package", "where is my order"],
    search: ["search", "find", "looking for", "under", "cheap", "black", "show products", "show me", "give me"],
    faq: ["shipping", "return", "refund", "payment", "exchange"],
};

const MAX_HISTORY_ITEMS = 12;
const MAX_ORDER_SIGNAL_ORDERS = 8;
const MAX_RECOMMENDATION_CANDIDATES = 18;
const RECOMMENDATION_FETCH_LIMIT = 36;
const RECOMMENDATION_CACHE_TTL_MS = 60 * 1000;
const NOISE_TOKENS = new Set([
    "a", "an", "any", "are", "can", "could", "find", "for", "give", "hello", "help",
    "i", "im", "i'm", "items", "item", "look", "looking", "maybe", "me", "my",
    "need", "of", "please", "product", "products", "recommend", "search", "show",
    "some", "suggest", "the", "these", "those", "want", "with", "you", "your",
]);
const aiClient = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;
const recommendationCache = new Map();

const normalizeText = (value = "") => value.toLowerCase().trim();

const tokenize = (value = "") =>
    normalizeText(value)
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

const findHintValue = (normalized, tokens, hints) => {
    for (const [keyword, value] of Object.entries(hints)) {
        if (keyword.includes(" ")) {
            if (normalized.includes(keyword)) {
                return value;
            }
            continue;
        }

        if (tokens.includes(keyword)) {
            return value;
        }
    }

    return null;
};

const getMatchedHintTokens = (normalized, tokens, hints) => {
    const matchedTokens = new Set();

    for (const keyword of Object.keys(hints)) {
        if (keyword.includes(" ")) {
            if (normalized.includes(keyword)) {
                keyword.split(/\s+/).filter(Boolean).forEach((token) => matchedTokens.add(token));
            }
            continue;
        }

        if (tokens.includes(keyword)) {
            matchedTokens.add(keyword);
        }
    }

    return matchedTokens;
};

const hasExplicitFilters = (filters) => Boolean(
    filters.category
    || filters.subCategory
    || filters.keyword
    || filters.maxPrice
    || filters.colors?.length
);

const buildKeywordRegex = (keyword = "") => {
    const terms = tokenize(keyword).filter(Boolean);
    if (!terms.length) return null;

    const pattern = terms
        .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");

    return new RegExp(pattern, "i");
};

const buildProductQuery = (filters, { includeKeyword = true } = {}) => {
    const query = {};

    if (filters.category) query.category = filters.category;
    if (filters.subCategory) query.subCategory = filters.subCategory;
    if (filters.maxPrice) query.price = { $lte: filters.maxPrice };

    if (includeKeyword && filters.keyword) {
        const keywordRegex = buildKeywordRegex(filters.keyword);
        if (keywordRegex) {
            query.$or = [
                { name: keywordRegex },
                { description: keywordRegex },
            ];
        }
    }

    return query;
};

const getRankedProducts = async ({
    query,
    message,
    filters,
    limit = 6,
    fetchLimit = 36,
    sort = { bestseller: -1, date: -1 },
}) => {
    const candidates = await Product.find(query)
        .sort(sort)
        .limit(fetchLimit)
        .lean();

    return candidates
        .filter((product) => matchesExplicitFilters(product, filters))
        .sort((a, b) => scoreProductAgainstMessage(b, message) - scoreProductAgainstMessage(a, message))
        .slice(0, limit);
};

const getClosestPriceProducts = async (filters, message, { limit = 6 } = {}) => {
    if (!filters.maxPrice) return [];

    const relaxedFilters = { ...filters, maxPrice: null, colors: [] };
    const relaxedQuery = buildProductQuery(relaxedFilters);
    const candidates = await Product.find(relaxedQuery)
        .sort({ price: 1, bestseller: -1, date: -1 })
        .limit(24)
        .lean();

    return candidates
        .map((product) => ({
            product,
            distance: Math.abs(product.price - filters.maxPrice),
        }))
        .sort((a, b) => a.distance - b.distance || a.product.price - b.product.price)
        .map(({ product }) => product)
        .slice(0, limit);
};

const detectIntent = (message) => {
    const normalized = normalizeText(message);

    for (const [intent, phrases] of Object.entries(INTENT_KEYWORDS)) {
        if (phrases.some((phrase) => normalized.includes(phrase))) {
            return intent;
        }
    }

    return "general";
};

const extractMaxPrice = (normalized) => {
    const explicitPriceMatch = normalized.match(
        /(?:under|below|less than|within|max(?:imum)?|budget(?: of)?|up to)\s*(?:tk|taka|\$)?\s*(\d+)/
    ) || normalized.match(
        /(?:tk|taka|\$)\s*(\d+)/
    ) || normalized.match(
        /(\d+)\s*(?:tk|taka|dollars?)/
    );

    return explicitPriceMatch ? Number(explicitPriceMatch[1]) : null;
};

const extractSearchParams = (message) => {
    const normalized = normalizeText(message);
    const tokens = tokenize(message);
    const maxPrice = extractMaxPrice(normalized);
    const colors = COLOR_WORDS.filter((color) => tokens.includes(color));
    const category = findHintValue(normalized, tokens, CATEGORY_HINTS);
    const subCategory = findHintValue(normalized, tokens, SUBCATEGORY_HINTS);
    const matchedHintTokens = new Set([
        ...getMatchedHintTokens(normalized, tokens, CATEGORY_HINTS),
        ...getMatchedHintTokens(normalized, tokens, SUBCATEGORY_HINTS),
    ]);
    const keywordTokens = tokens.filter((token) => (
        !COLOR_WORDS.includes(token)
        && !matchedHintTokens.has(token)
        && !["below", "cheap", "find", "give", "less", "show", "than", "under", "within"].includes(token)
        && !NOISE_TOKENS.has(token)
        && Number.isNaN(Number(token))
    ));

    return {
        keyword: keywordTokens.join(" ").trim(),
        maxPrice,
        category,
        subCategory,
        colors,
    };
};

const matchesColorHints = (product, colors) => {
    if (!colors.length) return true;
    const haystack = `${product.name} ${product.description}`.toLowerCase();
    return colors.some((color) => haystack.includes(color));
};

const matchesExplicitFilters = (product, filters) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.subCategory && product.subCategory !== filters.subCategory) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    return matchesColorHints(product, filters.colors || []);
};

const scoreProductAgainstMessage = (product, message) => {
    const normalizedMessage = normalizeText(message);
    let score = 0;

    if (normalizedMessage.includes(normalizeText(product.category))) score += 3;
    if (normalizedMessage.includes(normalizeText(product.subCategory))) score += 2;

    for (const token of tokenize(message)) {
        if (product.name.toLowerCase().includes(token)) score += 2;
        if (product.description.toLowerCase().includes(token)) score += 1;
    }

    if (product.bestseller) score += 1;
    return score;
};

const scoreProductForRecommendation = (product, message, signalScores) => {
    let score = scoreProductAgainstMessage(product, message);

    score += (signalScores.get(product.category) || 0) * 4;
    score += (signalScores.get(product.subCategory) || 0) * 3;

    for (const [signal, weight] of signalScores.entries()) {
        const normalizedSignal = normalizeText(signal);
        if (!normalizedSignal) continue;

        if (product.name.toLowerCase().includes(normalizedSignal)) score += weight * 2;
        if (product.description.toLowerCase().includes(normalizedSignal)) score += weight;
    }

    return score;
};

const searchProducts = async (message) => {
    const filters = extractSearchParams(message);
    const query = buildProductQuery(filters);
    const products = await getRankedProducts({ query, message, filters });

    if (products.length) {
        return {
            filters,
            products,
            matchType: "exact",
        };
    }

    if (filters.keyword) {
        const noKeywordFilters = { ...filters, keyword: "" };
        const relaxedProducts = await getRankedProducts({
            query: buildProductQuery(noKeywordFilters),
            message,
            filters: noKeywordFilters,
        });

        if (relaxedProducts.length) {
            return {
                filters,
                products: relaxedProducts,
                matchType: "relaxed-keyword",
            };
        }
    }

    if (filters.colors?.length) {
        const noColorFilters = { ...filters, colors: [] };
        const relaxedProducts = await getRankedProducts({
            query: buildProductQuery(noColorFilters),
            message,
            filters: noColorFilters,
        });

        if (relaxedProducts.length) {
            return {
                filters,
                products: relaxedProducts,
                matchType: "relaxed-color",
            };
        }
    }

    if (filters.maxPrice) {
        const closestPriceProducts = await getClosestPriceProducts(filters, message);
        if (closestPriceProducts.length) {
            return {
                filters,
                products: closestPriceProducts,
                matchType: "closest-price",
            };
        }
    }

    return {
        filters,
        products: [],
        matchType: "none",
    };
};

const getRecommendationProducts = async (user, message = "") => {
    const userActivityStamp = user?.updatedAt ? new Date(user.updatedAt).getTime() : "none";
    const cacheKey = `${user?._id?.toString() || "guest"}:${userActivityStamp}:${normalizeText(message)}`;
    const cachedEntry = recommendationCache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
        return cachedEntry.products;
    }

    const scoreMap = new Map();
    const addSignal = (value, weight = 1) => {
        if (!value) return;
        scoreMap.set(value, (scoreMap.get(value) || 0) + weight);
    };
    const cacheProducts = (products) => {
        recommendationCache.set(cacheKey, {
            expiresAt: Date.now() + RECOMMENDATION_CACHE_TTL_MS,
            products,
        });
        return products;
    };

    if (user?._id) {
        const [orders, fullUser] = await Promise.all([
            Order.find({ userId: user._id })
                .sort({ createdAt: -1 })
                .limit(MAX_ORDER_SIGNAL_ORDERS)
                .select("items.productId")
                .lean(),
            User.findById(user._id)
                .select("viewedProducts.productId searchHistory.query")
                .lean(),
        ]);

        const orderedProductIds = new Set();
        const viewedProductIds = new Set();

        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (item.productId) {
                    orderedProductIds.add(item.productId.toString());
                }
            });
        });

        fullUser?.viewedProducts?.forEach((entry) => {
            if (entry.productId) {
                viewedProductIds.add(entry.productId.toString());
            }
        });

        const interactedProductIds = new Set([...orderedProductIds, ...viewedProductIds]);
        if (interactedProductIds.size) {
            const interactedProducts = await Product.find({
                _id: { $in: [...interactedProductIds] },
            })
                .select("category subCategory")
                .lean();

            interactedProducts.forEach((product) => {
                const productId = product._id.toString();
                if (orderedProductIds.has(productId)) {
                    addSignal(product.category, 3);
                    addSignal(product.subCategory, 2);
                }
                if (viewedProductIds.has(productId)) {
                    addSignal(product.category, 2);
                    addSignal(product.subCategory, 1);
                }
            });
        }

        fullUser?.searchHistory?.forEach((entry) => {
            const filters = extractSearchParams(entry.query);
            addSignal(filters.category, 2);
            addSignal(filters.subCategory, 1);
            filters.colors.forEach((color) => addSignal(color, 1));
            if (filters.keyword) addSignal(filters.keyword, 1);
        });
    }

    const messageFilters = extractSearchParams(message);
    addSignal(messageFilters.category, 4);
    addSignal(messageFilters.subCategory, 3);
    messageFilters.colors.forEach((color) => addSignal(color, 2));
    if (messageFilters.keyword) addSignal(messageFilters.keyword, 2);

    const topSignals = [...scoreMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_RECOMMENDATION_CANDIDATES)
        .map(([value]) => value);
    const query = buildProductQuery(messageFilters);

    if (!hasExplicitFilters(messageFilters) && topSignals.length) {
        query.$or = [
            { category: { $in: topSignals } },
            { subCategory: { $in: topSignals } },
        ];
    }

    const products = await Product.find(query)
        .sort({ bestseller: -1, date: -1 })
        .limit(RECOMMENDATION_FETCH_LIMIT)
        .lean();

    const rankedProducts = products
        .filter((product) => matchesExplicitFilters(product, messageFilters))
        .sort((a, b) => scoreProductForRecommendation(b, message, scoreMap) - scoreProductForRecommendation(a, message, scoreMap))
        .slice(0, 6);

    if (rankedProducts.length > 0) {
        return cacheProducts(rankedProducts);
    }

    const fallbackQuery = buildProductQuery(messageFilters);

    const fallbackProducts = await Product.find(fallbackQuery)
        .sort({ bestseller: -1, date: -1 })
        .limit(RECOMMENDATION_FETCH_LIMIT)
        .lean();

    const filteredFallbackProducts = fallbackProducts
        .filter((product) => matchesExplicitFilters(product, messageFilters))
        .slice(0, 6);

    if (filteredFallbackProducts.length > 0) {
        return cacheProducts(filteredFallbackProducts);
    }

    if (hasExplicitFilters(messageFilters)) {
        return cacheProducts([]);
    }

    const fallback = await Product.find().sort({ bestseller: -1, date: -1 }).limit(6).lean();
    return cacheProducts(fallback);
};

const createProductReply = (filters, fallbackText) => {
    const parts = [];

    if (filters.category) parts.push(filters.category.toLowerCase());
    if (filters.colors?.length) parts.push(filters.colors.join(", "));
    if (filters.subCategory) parts.push(filters.subCategory.toLowerCase());

    if (parts.length) {
        return `Here are some ${parts.join(" ")} products.`;
    }

    return fallbackText;
};

const createSearchReply = ({ filters, matchType }) => {
    if (matchType === "exact") {
        return createProductReply(filters, "I found these products based on your search.");
    }

    if (matchType === "relaxed-keyword") {
        return "I couldn't match all of those words exactly, but here are the closest products for your category and price.";
    }

    if (matchType === "relaxed-color") {
        return `I couldn't find ${filters.colors.join(", ")} items, but here are the closest matches for the rest of your search.`;
    }

    if (matchType === "closest-price") {
        return `I couldn't find products within ${filters.maxPrice}, but here are the closest options I found.`;
    }

    return "I couldn't find an exact match, but try broadening the keywords or price range.";
};

const getLatestOrderSummary = async (userId) => {
    if (!userId) return null;

    const latestOrder = await Order.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate("items.productId", "name")
        .lean();

    if (!latestOrder) return null;

    return latestOrder;
};

const detectOrderRequestScope = (message) => {
    const normalized = normalizeText(message);

    if (
        normalized.includes("all order")
        || normalized.includes("all orders")
        || normalized.includes("my orders")
        || normalized.includes("order history")
        || normalized.includes("every order")
        || normalized.includes("all my orders")
        || normalized.includes("all my order")
        || normalized.includes("orders")
    ) {
        return "all";
    }

    return "latest";
};

const getAllOrderSummaries = async (userId) => {
    if (!userId) return [];

    return Order.find({ userId })
        .sort({ createdAt: -1 })
        .select("amount status items createdAt")
        .lean();
};

const formatAllOrdersReply = (orders) => {
    if (!orders.length) {
        return "You don't have any orders yet.";
    }

    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
    const orderSummaries = orders
        .slice(0, 5)
        .map((order, index) => {
            const createdAt = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });

            return `${index + 1}. ${createdAt}: ${order.status}, ${order.items.length} item(s), $${order.amount}`;
        })
        .join(" ");

    const remainingCount = orders.length - 5;
    const remainderText = remainingCount > 0
        ? ` There are ${remainingCount} more order(s) not shown here.`
        : "";

    return `You have ${orders.length} order(s) in total and have spent $${totalSpent}. ${orderSummaries}${remainderText}`;
};

const getFaqReply = (message) => {
    const normalized = normalizeText(message);
    const faqKey = Object.keys(FAQ_RESPONSES).find((key) => normalized.includes(key));
    return faqKey ? FAQ_RESPONSES[faqKey] : null;
};

const getGeminiReply = async ({ message, user, latestOrder, searchResult, recommendations }) => {
    if (!aiClient) {
        return null;
    }

    try {
        const context = {
            shopper: user ? { name: user.name, email: user.email } : null,
            latestOrder: latestOrder ? {
                status: latestOrder.status,
                amount: latestOrder.amount,
                createdAt: latestOrder.createdAt,
                items: latestOrder.items.map((item) => ({
                    name: item.productId?.name || "Product",
                    size: item.size,
                    quantity: item.quantity,
                })),
            } : null,
            searchFilters: searchResult?.filters || null,
            recommendationNames: recommendations?.map((item) => item.name) || [],
        };

        const response = await aiClient.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
            contents: [
                "You are a smart e-commerce assistant for ForeverBuy.",
                "Keep answers concise, helpful, and grounded in the provided store context.",
                "Do not invent policies, order details, or product facts.",
                `Store context: ${JSON.stringify(context)}`,
                `Customer message: ${message}`,
            ].join("\n"),
        });

        return response.text?.trim() || null;
    } catch (error) {
        console.error("Gemini assistant fallback triggered:", error.message);
        return null;
    }
};

export const chatWithAI = async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
        return res.status(400).json({ success: false, message: "A message is required." });
    }

    try {
        const intent = detectIntent(message);
        const faqReply = getFaqReply(message);

        if (faqReply) {
            return res.status(200).json({
                success: true,
                type: "text",
                intent: "faq",
                reply: faqReply,
            });
        }

        if (intent === "recommend") {
            const products = await getRecommendationProducts(req.user, message);
            const filters = extractSearchParams(message);
            return res.status(200).json({
                success: true,
                type: "products",
                intent,
                reply: products.length
                    ? createProductReply(filters, "Here are some products that match your style and shopping history.")
                    : "I couldn't find products that exactly match your request. Try another category, color, or price range.",
                products,
            });
        }

        if (intent === "search") {
            const result = await searchProducts(message);
            const reply = result.products.length
                ? createSearchReply(result)
                : createSearchReply(result);

            return res.status(200).json({
                success: true,
                type: "products",
                intent,
                reply,
                filters: result.filters,
                products: result.products,
            });
        }

        if (intent === "order" && req.user?._id) {
            const orderScope = detectOrderRequestScope(message);

            if (orderScope === "all") {
                const orders = await getAllOrderSummaries(req.user._id);
                return res.status(200).json({
                    success: true,
                    type: "text",
                    intent,
                    reply: formatAllOrdersReply(orders),
                    orders,
                });
            }

            const latestOrder = await getLatestOrderSummary(req.user._id);
            if (latestOrder) {
                return res.status(200).json({
                    success: true,
                    type: "text",
                    intent,
                    reply: `Your latest order is currently ${latestOrder.status}. It contains ${latestOrder.items.length} item(s) and the total was $${latestOrder.amount}.`,
                    order: latestOrder,
                });
            }
        }

        const searchResult = intent === "general" ? await searchProducts(message) : null;
        const recommendations = await getRecommendationProducts(req.user, message);
        const aiReply = await getGeminiReply({
            message,
            user: req.user,
            latestOrder: req.user?._id ? await getLatestOrderSummary(req.user._id) : null,
            searchResult,
            recommendations,
        });

        if (searchResult?.products?.length) {
            return res.status(200).json({
                success: true,
                type: "products",
                intent,
                reply: aiReply || createSearchReply(searchResult),
                filters: searchResult.filters,
                products: searchResult.products,
            });
        }

        return res.status(200).json({
            success: true,
            type: "text",
            intent,
            reply: aiReply || "I can help with product search, recommendations, order questions, shipping, and returns.",
        });
    } catch (error) {
        console.error("AI chat error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process your assistant request.",
            error: error.message,
        });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        const products = await getRecommendationProducts(req.user, req.query.message || "");
        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("Recommendation error:", error);
        return res.status(500).json({ success: false, message: "Failed to load recommendations." });
    }
};

export const trackUserActivity = async (req, res) => {
    const { type, productId, query } = req.body;

    if (!req.user?._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const updates = {};

        if (type === "view" && productId) {
            const product = await Product.findById(productId).select("_id").lean();
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found." });
            }

            const filteredViews = req.user.viewedProducts.filter(
                (entry) => entry.productId.toString() !== productId
            );

            updates.viewedProducts = [{ productId, viewedAt: new Date() }, ...filteredViews].slice(0, MAX_HISTORY_ITEMS);
        }

        if (type === "search" && query) {
            const cleanedQuery = query.trim();
            if (cleanedQuery) {
                const filteredSearches = req.user.searchHistory.filter(
                    (entry) => entry.query.toLowerCase() !== cleanedQuery.toLowerCase()
                );
                updates.searchHistory = [{ query: cleanedQuery, createdAt: new Date() }, ...filteredSearches].slice(0, MAX_HISTORY_ITEMS);
            }
        }

        if (!Object.keys(updates).length) {
            return res.status(400).json({ success: false, message: "No valid activity payload provided." });
        }

        await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        return res.status(200).json({ success: true, message: "Activity tracked successfully." });
    } catch (error) {
        console.error("Track activity error:", error);
        return res.status(500).json({ success: false, message: "Failed to track activity." });
    }
};

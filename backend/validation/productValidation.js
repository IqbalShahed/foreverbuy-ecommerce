import Joi from "joi";

export const productSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().required(),
    subCategory: Joi.string().required(),
    sizes: Joi.alternatives()
        .try(
            Joi.array().items(Joi.string()), // if parsed already
            Joi.string() // if stringified from frontend
        )
        .required(),
    bestseller: Joi.boolean().truthy("true").falsy("false").default(false),
});

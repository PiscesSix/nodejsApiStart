const Joi = require('@hapi/joi')

const validateBody = (schema) => {
    return (req, res, next) => {
        const validatorResult = schema.validate(req.body)
        
        if (validatorResult.error) {
            return res.status(400).json(validatorResult.error)
        } else {
            if (!req.value) req.value = {}
            if (!req.value['params']) req.value.params = {}
        
            req.value.body = validatorResult.value
            next()
        }
    }
}

// Need: Condition of validator and Name of param need validate
const validateParam = (schema, name) => {
    return (req, res, next) => {
        
        // console.log('params:', req.params[name])
        const validatorResult = schema.validate({param: req.params[name]})
        // console.log('result ', validatorResult)

        if (validatorResult.error) {
            return res.status(400).json(validatorResult.error)
        } else {
            if (!req.value) req.value = {}
            if (!req.value['params']) req.value.params = {}
            req.value.params[name] = req.params[name]
            next()
        }
    }
}

const schemas = {
    idSchema: Joi.object().keys({
        param: Joi.string().regex(/^[0-9]$/).required()
    }),

    newDeckSchema: Joi.object().keys({
        name: Joi.string().min(6).required(),
        description: Joi.string().min(10).required(),
        // owner: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
    }),

    userSchema: Joi.object().keys({
        firstName: Joi.string().min(2).required(),
        lastName: Joi.string().min(2).required(),
        email: Joi.string().email().required()
    }),

    userOptionalSchema: Joi.object().keys({
        firstName: Joi.string().min(2),
        lastName: Joi.string().min(2),
        email: Joi.string().email()
    }),

    // Bản chất là chỉ cần update một trong các trường nên không cần phải có required()
    deckOptionalSchema: Joi.object().keys({
        name: Joi.string().min(6),
        description: Joi.string().min(10),
        owner: Joi.number()
    }),

    deckSchema: Joi.object().keys({
        name: Joi.string().min(6).required(),
        description: Joi.string().min(10).required(),
        owner: Joi.number().required()
    })
}

module.exports = {
    validateParam,
    validateBody,
    schemas
}
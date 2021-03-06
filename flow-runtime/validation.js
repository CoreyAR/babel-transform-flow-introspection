import joi from "joi";

export const setup = (Exports) => {
  const generateSchema = (type) => {
    return validators[type.type](type);
  }

  const validateString = () => joi.string();
  const validateNum = () => joi.number();
  const validateBool = () => joi.boolean();
  const validateVoid = () => joi.valid(void 8);
  const validateLiteral = (def) => joi.valid(def.value);
  const validateUnion = (def) => joi.only(def.types.map(x => x.value));

  const validateObject = (def) => {
    return joi.object(def.properties.reduce((acc, prop) => {
        acc[prop.key.name] = generateSchema(prop.value);
        return acc;
      }, {})
    );
  }

  const validateArrayOf = (def) => {
    const typeParam = def.typeParameters && def.typeParameters.params && def.typeParameters.params[0];

    if (!typeParam) {
      return joi.array();
    }

    return joi.array().items(generateSchema(typeParam));
  };

  const validateGeneric = (def) => {
    const exportedName = def.id.name + "Type";

    if (Exports[exportedName]) {
      return generateSchema(Exports[exportedName]);
    }

    if (validators[def.id.name]) {
      return validators[def.id.name](def);
    }

    throw new Error("No type declaration found for " + def.id.name);
  };

  const validators = {
    "ObjectTypeAnnotation": validateObject,
    "GenericTypeAnnotation": validateGeneric,
    "AnyTypeAnnotation": validateString,
    "MixedTypeAnnotation": validateString,
    "StringTypeAnnotation": validateString,
    "StringLiteralTypeAnnotation": validateLiteral,
    "NumericLiteralTypeAnnotation": validateLiteral,
    "NullLiteralTypeAnnotation": validateLiteral,
    "NumberTypeAnnotation": validateNum,
    "BooleanTypeAnnotation": validateBool,
    "UnionTypeAnnotation": validateUnion,
    "VoidTypeAnnotation": (def) => joi.valid(void 8),
    "Array": validateArrayOf,
  }

  const validate = (value, type) => {
    if (!type) {
      throw new Error("Invalid type " + type);
    }

    return joi.validate(value, generateSchema(type), {
      abortEarly: false
    });
  }

  return { generateSchema, validate };
}

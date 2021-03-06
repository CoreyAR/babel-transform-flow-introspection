import range from "lodash.range";

export const setup = (Exports) => {
  const genObjectProp = function(def) {
    console.log(def.key.name);
  };

  const genObject = function(def) {
    return (def.properties || []).reduce((acc, prop) => {
      acc[prop.key.name] = gen(prop.value);
      return acc;
    }, {});
  };

  const genString = () => "String";
  const genNum = () => 1;
  const genUnion = (def) => def.types.map(x => generatorFor(x.type)(x))[0]; // Take the 0th for now
  const genNull = () => null;
  const genBool = () => true;
  const genVoid = () => void 8;
  const genLiteral = (def) => def.value;
  const genArrayOf = (def) => {
    const typeParams = def.typeParameters && def.typeParameters.params && def.typeParameters.params.map(gen) || [];
    return typeParams;
  };
  const genGeneric = (def) => {
    const exportedName = def.id.name + "Type";

    if (Exports[exportedName]) {
      return gen(Exports[exportedName]);
    }

    if (generators[def.id.name]) {
      return generators[def.id.name](def);
    }

    throw new Error("No type declaration found for " + def.id.name);
  };
  const genFunc = (def) => () => gen(def.returnType);

  const generators = {
    "Object": genObject,
    "ObjectTypeAnnotation": genObject,
    "GenericTypeAnnotation": genGeneric,
    "AnyTypeAnnotation": genString,
    "MixedTypeAnnotation": genString,
    "StringTypeAnnotation": genString,
    "StringLiteralTypeAnnotation": genLiteral,
    "NumericLiteralTypeAnnotation": genLiteral,
    "NullLiteralTypeAnnotation": genLiteral,
    "NumberTypeAnnotation": genNum,
    "BooleanTypeAnnotation": genBool,
    "UnionTypeAnnotation": genUnion,
    "VoidTypeAnnotation": genVoid,
    "Array": genArrayOf,
    "Function": genFunc,
    "FunctionTypeAnnotation": genFunc,
  }

  const generatorFor = (type) => {
    if (!generators[type]) {
      throw new Error("No type generator found for " + type);
    }
    return generators[type];
  }

  const gen = (type) => {
    if (!type) {
      throw new Error("Invalid type " + type);
    }
    return generatorFor(type.type)(type);
  }

  const genN = (type, n) => range(0, n).reduce((examples, _) => examples.concat([gen(type)]), []);

  return { gen, genN };
}

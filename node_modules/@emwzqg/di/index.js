
const declared = {};
const declaredSingleton = {};

const singletons = {};
const instantiatedSingletons = new Set();

module.exports = {
    register: (label, f) => {
        delete declaredSingleton[label];
        declared[label] = f;
    },
    registerSingleton: (label, f) => {
        delete declared[label];
        declaredSingleton[label] = f;
    },
    inject: function(label) {
        if (declaredSingleton[label]) {
            if (!instantiatedSingletons.has(label)) {
                singletons[label] = build(declaredSingleton[label], arguments);
                instantiatedSingletons.add(label);
            }
            
            return singletons[label];
        }
        else if (declared[label]) {
            return build(declared[label], arguments);
        }
        else {
            throw new Error(`No provider registered for label "${label}".`);
        }
    }
};

function build(f, parentArguments) {
    const injectedArgs =
            (f.dependencies || []).map(dLabel => module.exports.inject(dLabel));
    const dynamicArgs = Array.prototype.slice(arguments, 1);
    
    return f(...injectedArgs, ...dynamicArgs);
}
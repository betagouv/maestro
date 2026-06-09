import { registerHooks } from 'node:module';

//Permet d'éviter de réécrire tous les imports du projet pour ajouter .ts
//Peut-être à faire plus tard
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      if (specifier.startsWith('.') || !specifier.includes(':')) {
        for (const suffix of ['.ts', '/index.ts']) {
          try {
            return nextResolve(specifier + suffix, context);
          } catch {}
        }
      }
      throw err;
    }
  }
});

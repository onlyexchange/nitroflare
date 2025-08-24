import { PROVIDERS, type Provider } from '../data/providers';

export const getProviders = () => PROVIDERS;

export const getProviderMap = () =>
  PROVIDERS.reduce<Record<string, Provider>>((m, p) => (m[p.slug] = p, m), {});

export const findProvider = (slug: string) =>
  PROVIDERS.find(p => p.slug === slug);

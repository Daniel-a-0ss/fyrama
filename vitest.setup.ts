import "@testing-library/jest-dom/vitest";

// No se requieren polyfills adicionales: node >= 20 expone fetch, Request,
// Response, FormData, Headers que usa Next route handlers.
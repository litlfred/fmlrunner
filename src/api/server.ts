// MIGRATION NOTE: This API server should be replaced with kotlin-fhir server implementation
// See: https://github.com/google/android-fhir
//
// TODO: Replace with Kotlin server implementation
// - Use Ktor or Spring Boot for REST API
// - Implement FHIR $transform operation using kotlin-fhir
// - Use kotlin-fhir terminology services for $validate-code, $translate, etc.
// - Leverage kotlin-fhir resource management and validation

export class FmlRunnerApi {
  constructor() {
    console.warn('FmlRunnerApi: This TypeScript server implementation will be replaced with kotlin-fhir');
    throw new Error('FmlRunnerApi: Migrate to kotlin-fhir server implementation (Ktor/Spring Boot)');
  }

  listen(port: number): void {
    throw new Error('FmlRunnerApi: Use kotlin-fhir server implementation instead');
  }

  close(): void {
    throw new Error('FmlRunnerApi: Use kotlin-fhir server implementation instead');
  }
}
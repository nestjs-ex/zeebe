export function getZbClientOptionsToken(name?: string): string {
  return name ? `ZeebeClientOptions_${name}` : 'ZeebeClientOptions_default';
}

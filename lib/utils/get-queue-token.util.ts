export function getZbClientToken(name?: string): string {
  return name ? `ZeebeClient_${name}` : 'ZeebeClient_default';
}

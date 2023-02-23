export function getMultipleRandomElements<T>(arr: T[], numberOfElements: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, numberOfElements);
}

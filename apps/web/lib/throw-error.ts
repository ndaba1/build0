export function throwError(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

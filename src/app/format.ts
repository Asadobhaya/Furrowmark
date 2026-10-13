export function formatPKR(minor: number | bigint): string {
  const num = typeof minor === "bigint" ? Number(minor) : minor;
  return (num / 100).toLocaleString("en-PK", {
    style: "currency",
    currency: "PKR",
  });
}

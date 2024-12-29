export const formatPrice = (cents: number | null) => {
   if (cents === null) return "Not available";
   return (cents / 100).toLocaleString("de-DE", {
     style: "currency",
     currency: "EUR",
   });
 };
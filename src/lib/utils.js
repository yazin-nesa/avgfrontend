import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// You can also define other utility functions here
export const fetcher = async (url) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}/`,{
    headers:{
      authorization:`Bearer ${localStorage.getItem("token")}`,
      user:localStorage.getItem("user")
    }
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
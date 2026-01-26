import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatNumber(n: number) {
  const abs = Math.abs(n);

  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(2) + "K";

  return n.toString();
}
  export const formatDelta = (delta: number, showSign: boolean = true) => {
    const sign = showSign ? (delta > 0 ? '+' : delta < 0 ? '' : '') : '';
    return `${sign}${formatNumber(Math.abs(delta))}`;
  };

  export const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-500';
    if (delta < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, ''); // remove pontos e traços

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let rev = 11 - (sum % 11);
  let digit1 = rev >= 10 ? 0 : rev;

  if (digit1 !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }

  rev = 11 - (sum % 11);
  let digit2 = rev >= 10 ? 0 : rev;

  return digit2 === parseInt(cpf.charAt(10));
}

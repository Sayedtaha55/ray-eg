'use client';

export function useToast() {
  return {
    toast: (props: any) => console.log('Toast:', props),
    addToast: (props: any) => console.log('Toast:', props),
  };
}

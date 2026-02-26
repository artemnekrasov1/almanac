"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { getDiscountDotColor, type Product } from "./product-card";

interface Props {
  product: Product;
  onClose: () => void;
}

function FadeImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <motion.img
      src={src}
      alt={alt}
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onLoad={() => setLoaded(true)}
    />
  );
}

export function ProductDetailOverlay({ product, onClose }: Props) {
  const [images, setImages] = useState<string[]>(
    product.image_url ? [product.image_url] : []
  );
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch additional images from product_images table
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/product-images?productId=${encodeURIComponent(product.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const urls: string[] = (data.images ?? []).map(
          (img: { url: string }) => img.url
        );
        if (urls.length > 0) {
          setImages(urls);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{
        background: "rgba(246, 246, 243, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Desktop layout */}
      <motion.div
        className="hidden lg:flex justify-center w-full h-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-[960px] h-full bg-white">
          {/* Fixed back button */}
          <div className="absolute top-[24px] left-[24px] z-10">
            <Badge
              variant="nav"
              className="nav-pill cursor-pointer"
              onClick={onClose}
            >
              Close
            </Badge>
          </div>

          {/* Fixed right column: product info */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full flex items-center px-[40px]"
            onWheel={(e) => {
              galleryRef.current?.scrollBy({ top: e.deltaY });
            }}
          >
            <div className="w-full">
              <div className="font-serif italic text-[32px] font-medium leading-tight">
                {product.brand ?? "—"}
              </div>
              <div className="font-serif text-[17px] text-black/40 mt-[2px]">
                {product.title}
              </div>
              {product.sizes_raw && (
                <div className="mt-[40px] flex flex-col gap-[8px]">
                  <div className="font-sans font-medium text-[11px] uppercase text-black/40 tracking-wide">
                    Available sizes
                  </div>
                  <div className="font-serif font-medium text-[13px]">
                    {product.sizes_raw}
                  </div>
                </div>
              )}
              {product.description && (
                <div className="mt-[40px] flex flex-col gap-[8px]">
                  <div className="font-sans font-medium text-[11px] uppercase text-black/40 tracking-wide">
                    Description
                  </div>
                  <div className="font-serif font-medium text-[13px]">
                    {product.description}
                  </div>
                </div>
              )}
              <div className="mt-[40px]">
                {typeof product.discount_percent === "number" &&
                  getDiscountDotColor(product.discount_percent) && (
                    <div className="flex items-center gap-[8px]">
                      <span
                        className="block w-[12px] h-[12px] rounded-full shrink-0"
                        style={{ backgroundColor: getDiscountDotColor(product.discount_percent)! }}
                      />
                      <span className="font-serif font-medium text-[13px]">
                        -{product.discount_percent}%
                      </span>
                    </div>
                  )}
                <div className="flex items-baseline mt-[4px]">
                  <span className="font-serif font-medium text-[17px]">
                    {product.price_sale ?? "—"} {product.currency ?? "EUR"}
                  </span>
                  {product.price_original != null && product.price_original !== product.price_sale && (
                    <span className="font-serif font-medium text-[17px] text-black/40 line-through ml-[8px]">
                      {product.price_original} {product.currency ?? "EUR"}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-[16px] flex gap-[8px]">
                <a
                  href={`/out/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center h-[40px] px-[16px] bg-black rounded-full font-sans font-medium text-[12px] uppercase text-white"
                >
                  Buy on {product.merchant_name ?? "Store"}
                </a>
                <button className="flex items-center justify-center h-[40px] px-[16px] bg-[#F6F6F3] rounded-full font-sans font-medium text-[12px] uppercase text-black">
                  Add to favorites
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable left column: images */}
          <div ref={galleryRef} className="w-1/2 h-full overflow-y-auto">
            <div className="flex flex-col gap-[2px]">
              {images.map((src, i) => (
                <FadeImage
                  key={src}
                  src={src}
                  alt={`${product.title ?? "Product"} ${i + 1}`}
                  className="w-full h-auto block"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile layout */}
      <motion.div
        className="flex lg:hidden flex-col w-full h-full overflow-y-auto bg-white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="fixed top-[16px] left-[16px] z-10">
          <Badge
            variant="nav"
            className="nav-pill cursor-pointer"
            onClick={onClose}
          >
            Close
          </Badge>
        </div>

        {/* Horizontal image scroll */}
        <div className="flex overflow-x-auto gap-[2px]">
          {images.map((src, i) => (
            <FadeImage
              key={src}
              src={src}
              alt={`${product.title ?? "Product"} ${i + 1}`}
              className="max-w-[80vw] h-auto shrink-0"
            />
          ))}
        </div>

        {/* Product info */}
        <div className="p-[24px]">
          <div className="font-serif italic text-[32px] font-medium leading-tight">
            {product.brand ?? "—"}
          </div>
          <div className="font-serif text-[17px] text-black/40 mt-[2px]">
            {product.title}
          </div>
          {product.sizes_raw && (
            <div className="mt-[40px] flex flex-col gap-[8px]">
              <div className="font-sans font-medium text-[11px] uppercase text-black/40 tracking-wide">
                Available sizes
              </div>
              <div className="font-serif font-medium text-[13px]">
                {product.sizes_raw}
              </div>
            </div>
          )}
          {product.description && (
            <div className="mt-[40px] flex flex-col gap-[8px]">
              <div className="font-sans font-medium text-[11px] uppercase text-black/40 tracking-wide">
                Description
              </div>
              <div className="font-serif font-medium text-[13px]">
                {product.description}
              </div>
            </div>
          )}
          <div className="mt-[40px]">
            {typeof product.discount_percent === "number" &&
              getDiscountDotColor(product.discount_percent) && (
                <div className="flex items-center gap-[8px]">
                  <span
                    className="block w-[12px] h-[12px] rounded-full shrink-0"
                    style={{ backgroundColor: getDiscountDotColor(product.discount_percent)! }}
                  />
                  <span className="font-serif font-medium text-[13px]">
                    -{product.discount_percent}%
                  </span>
                </div>
              )}
            <div className="flex items-baseline mt-[4px]">
              <span className="font-serif font-medium text-[17px]">
                {product.price_sale ?? "—"} {product.currency ?? "EUR"}
              </span>
              {product.price_original != null && product.price_original !== product.price_sale && (
                <span className="font-serif font-medium text-[17px] text-black/40 line-through ml-[8px]">
                  {product.price_original} {product.currency ?? "EUR"}
                </span>
              )}
            </div>
          </div>
          <div className="mt-[16px] flex gap-[8px]">
            <a
              href={`/out/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center h-[40px] px-[16px] bg-black rounded-full font-sans font-medium text-[12px] uppercase text-white"
            >
              Buy on {product.merchant_name ?? "Store"}
            </a>
            <button className="flex items-center justify-center h-[40px] px-[16px] bg-[#F6F6F3] rounded-full font-sans font-medium text-[12px] uppercase text-black">
              Add to favorites
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

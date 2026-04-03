"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const AUTOPLAY_DELAY_MS = 4000;
const RESUME_AFTER_MANUAL_MS = 4000;

export default function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY_MS,
      stopOnInteraction: true,
      stopOnFocusIn: false,
    })
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const resumeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const manualInteractionRef = React.useRef(false);

  const clearResumeTimer = React.useCallback(() => {
    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!api) return;

    const onPointerDown = () => {
      manualInteractionRef.current = true;
      clearResumeTimer();
    };

    const onSettle = () => {
      if (!manualInteractionRef.current) return;
      manualInteractionRef.current = false;
      clearResumeTimer();
      resumeTimerRef.current = setTimeout(() => {
        resumeTimerRef.current = null;
        plugin.current.play();
      }, RESUME_AFTER_MANUAL_MS);
    };

    api.on("pointerDown", onPointerDown);
    api.on("settle", onSettle);

    return () => {
      api.off("pointerDown", onPointerDown);
      api.off("settle", onSettle);
      clearResumeTimer();
    };
  }, [api, clearResumeTimer]);

  return (
    <Carousel
      setApi={setApi}
      plugins={[plugin.current]}
      className="w-full rounded-lg overflow-hidden shadow-sm"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={() => {
        if (resumeTimerRef.current !== null) return;
        plugin.current.play();
      }}
    >
      <CarouselContent>
        {[1, 2, 3, 4].map((index) => (
          <CarouselItem key={index}>
            <div className="relative w-full h-[200px] md:h-[300px]">
              <Image
                src={`https://placehold.co/800x300/ffe4e1/000000?text=CAROUSEL+BANNER+${index}`}
                alt={`Carousel Banner ${index}`}
                fill
                priority={index === 1}
                className="object-cover"
                unoptimized
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

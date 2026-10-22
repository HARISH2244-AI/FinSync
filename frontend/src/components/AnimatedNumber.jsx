import { useEffect, useRef } from "react";
import gsap from "gsap";

function AnimatedNumber({ value, prefix = "₹" }) {
  const ref = useRef(null);
  const counter = useRef({ val: 0 });

  useEffect(() => {
    const tween = gsap.to(counter.current, {
      val: value,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${counter.current.val.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}`;
        }
      },
    });

    return () => tween.kill();
  }, [value, prefix]);

  return <span ref={ref}>{prefix}0.00</span>;
}

export default AnimatedNumber;
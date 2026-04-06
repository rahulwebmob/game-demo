import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type BellOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { opacity: 1 }, animate: { opacity: [1, 0.5, 1], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BellOffProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M10.268 21a2 2 0 0 0 3.464 0"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.77"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m2 2 20 20"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BellOff(props: BellOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  BellOff,
  BellOff as BellOffIcon,
  type BellOffProps,
};

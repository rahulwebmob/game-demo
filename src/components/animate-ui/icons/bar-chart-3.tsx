import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type BarChart3Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scaleY: 1 }, animate: { scaleY: [1, 0.85, 1.1, 1], transformOrigin: 'bottom', transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BarChart3Props) {
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
        d="M3 3v18h18"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18 17V9"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M13 17V5"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 17v-3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BarChart3(props: BarChart3Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  BarChart3,
  BarChart3 as BarChart3Icon,
  type BarChart3Props,
};

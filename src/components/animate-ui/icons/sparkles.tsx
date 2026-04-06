import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type SparklesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1, rotate: 0 }, animate: { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0], transition: { duration: 0.6, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SparklesProps) {
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
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20 3v4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M22 5h-4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 17v2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 18H3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Sparkles(props: SparklesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Sparkles,
  Sparkles as SparklesIcon,
  type SparklesProps,
};

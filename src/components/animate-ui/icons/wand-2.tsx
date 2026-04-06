import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type Wand2Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0 }, animate: { rotate: [0, -10, 5, 0], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Wand2Props) {
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
        d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m14 7 3 3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 6v4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 14v4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 2v2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 8H3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 16h-4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11 3H9"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Wand2(props: Wand2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Wand2,
  Wand2 as Wand2Icon,
  type Wand2Props,
};

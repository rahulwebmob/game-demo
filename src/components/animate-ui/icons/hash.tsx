import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type HashProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0 }, animate: { rotate: [0, -8, 8, 0], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: HashProps) {
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
      <motion.line
        x1={4} x2={20} y1={9} y2={9}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={4} x2={20} y1={15} y2={15}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={10} x2={8} y1={3} y2={21}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={16} x2={14} y1={3} y2={21}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Hash(props: HashProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Hash,
  Hash as HashIcon,
  type HashProps,
};

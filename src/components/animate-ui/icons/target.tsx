import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type TargetProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 0.85, 1.1, 1], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TargetProps) {
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
      <motion.circle
        cx={12} cy={12} r={10}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={12} cy={12} r={6}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={12} cy={12} r={2}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Target(props: TargetProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Target,
  Target as TargetIcon,
  type TargetProps,
};

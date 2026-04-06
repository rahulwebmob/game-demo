import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type GripVerticalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { y: 0 }, animate: { y: [0, -2, 2, 0], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GripVerticalProps) {
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
        cx={9} cy={12} r={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={9} cy={5} r={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={9} cy={19} r={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={15} cy={12} r={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={15} cy={5} r={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={15} cy={19} r={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function GripVertical(props: GripVerticalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  GripVertical,
  GripVertical as GripVerticalIcon,
  type GripVerticalProps,
};

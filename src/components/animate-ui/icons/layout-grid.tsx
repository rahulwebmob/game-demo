import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type LayoutGridProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 0.9, 1.05, 1], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LayoutGridProps) {
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
      <motion.rect
        width={7} height={7} x={3} y={3} rx={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        width={7} height={7} x={14} y={3} rx={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        width={7} height={7} x={14} y={14} rx={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        width={7} height={7} x={3} y={14} rx={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function LayoutGrid(props: LayoutGridProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  LayoutGrid,
  LayoutGrid as LayoutGridIcon,
  type LayoutGridProps,
};

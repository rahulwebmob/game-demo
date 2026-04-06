import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type BatteryProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 1.05, 1], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BatteryProps) {
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
        width={16} height={10} x={2} y={7} rx={2} ry={2}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={22} x2={22} y1={11} y2={13}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Battery(props: BatteryProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Battery,
  Battery as BatteryIcon,
  type BatteryProps,
};

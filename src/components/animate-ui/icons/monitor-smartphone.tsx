import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type MonitorSmartphoneProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 1.05, 1], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MonitorSmartphoneProps) {
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
        d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10 19v-3.96 3.15"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 19h5"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        x={16} y={12} width={6} height={10} rx={2}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function MonitorSmartphone(props: MonitorSmartphoneProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  MonitorSmartphone,
  MonitorSmartphone as MonitorSmartphoneIcon,
  type MonitorSmartphoneProps,
};

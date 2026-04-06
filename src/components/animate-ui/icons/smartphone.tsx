import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type SmartphoneProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0 }, animate: { rotate: [0, -3, 3, -1, 1, 0], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SmartphoneProps) {
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
        width={14} height={20} x={5} y={2} rx={2} ry={2}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 18h.01"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Smartphone(props: SmartphoneProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Smartphone,
  Smartphone as SmartphoneIcon,
  type SmartphoneProps,
};

import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type GiftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0, scale: 1 }, animate: { rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.05, 1], transition: { duration: 0.6, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GiftProps) {
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
        x={3} y={8} width={18} height={4} rx={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 8v13"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Gift(props: GiftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Gift,
  Gift as GiftIcon,
  type GiftProps,
};

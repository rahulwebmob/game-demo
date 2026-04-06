import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type ShoppingBagProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { y: 0 }, animate: { y: [0, -3, 0], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ShoppingBagProps) {
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
        d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 6h18"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 10a4 4 0 0 1-8 0"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ShoppingBag(props: ShoppingBagProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  ShoppingBag,
  ShoppingBag as ShoppingBagIcon,
  type ShoppingBagProps,
};

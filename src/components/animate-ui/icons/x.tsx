import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type XProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0, scale: 1 }, animate: { rotate: [0, 90], scale: [1, 0.8, 1], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: XProps) {
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
        d="M18 6 6 18"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m6 6 12 12"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function X(props: XProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  X,
  X as XIcon,
  type XProps,
};

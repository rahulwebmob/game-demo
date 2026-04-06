import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type MaximizeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 1.15, 1], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MaximizeProps) {
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
        d="M8 3H5a2 2 0 0 0-2 2v3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 8V5a2 2 0 0 0-2-2h-3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 16v3a2 2 0 0 0 2 2h3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 21h3a2 2 0 0 0 2-2v-3"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Maximize(props: MaximizeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Maximize,
  Maximize as MaximizeIcon,
  type MaximizeProps,
};

import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type MedalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotate: 0 }, animate: { rotate: [0, -8, 8, -4, 0], transformOrigin: 'top center', transition: { duration: 0.7, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MedalProps) {
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
        d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11 12 5.12 2.2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m13 12 5.88-9.8"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 21.8a1 1 0 0 1-.11-1.4l2-2.4a1 1 0 0 1 .77-.36h2.68a1 1 0 0 1 .77.36l2 2.4a1 1 0 0 1-.11 1.4 6 6 0 0 1-8 0Z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={12} cy={15} r={5}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Medal(props: MedalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Medal,
  Medal as MedalIcon,
  type MedalProps,
};

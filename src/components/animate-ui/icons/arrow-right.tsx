import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type ArrowRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { x: 0 }, animate: { x: [0, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArrowRightProps) {
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
        d="m12 5 7 7-7 7"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5 12h14"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ArrowRight(props: ArrowRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  ArrowRight,
  ArrowRight as ArrowRightIcon,
  type ArrowRightProps,
};

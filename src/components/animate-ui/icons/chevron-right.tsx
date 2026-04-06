import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type ChevronRightProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { x: 0 }, animate: { x: [0, 3, 0], transition: { duration: 0.3, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChevronRightProps) {
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
        d="m9 18 6-6-6-6"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChevronRight(props: ChevronRightProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  type ChevronRightProps,
};

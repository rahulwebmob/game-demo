import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type TrendingUpProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { y: 0 }, animate: { y: [0, -3, 0], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: TrendingUpProps) {
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
      <motion.polyline
        points="22 7 13.5 15.5 8.5 10.5 2 17"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.polyline
        points="16 7 22 7 22 13"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function TrendingUp(props: TrendingUpProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  TrendingUp,
  TrendingUp as TrendingUpIcon,
  type TrendingUpProps,
};

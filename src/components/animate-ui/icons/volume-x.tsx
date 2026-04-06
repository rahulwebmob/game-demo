import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type VolumeXProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 0.9, 1], transition: { duration: 0.3, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: VolumeXProps) {
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
        d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={22} x2={16} y1={9} y2={15}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={16} x2={22} y1={9} y2={15}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function VolumeX(props: VolumeXProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  VolumeX,
  VolumeX as VolumeXIcon,
  type VolumeXProps,
};

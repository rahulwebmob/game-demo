import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type CalendarDaysProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { y: 0 }, animate: { y: [0, -2, 0], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CalendarDaysProps) {
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
        d="M8 2v4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 2v4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.rect
        width={18} height={18} x={3} y={4} rx={2}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 10h18"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 14h.01"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 14h.01"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 14h.01"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 18h.01"
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
      <motion.path
        d="M16 18h.01"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function CalendarDays(props: CalendarDaysProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  CalendarDays,
  CalendarDays as CalendarDaysIcon,
  type CalendarDaysProps,
};

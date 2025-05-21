import { capitalize } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  View,
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

import Text from '../../Text';
import useColors from '../../useColors';
import { InputProps } from '../types';

import styles from './style';

const scaleRange = [1, 0.65];

const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput);

const Input = React.forwardRef(
  (
    { hideKeyboardOnBlur = true, label, style, error, onBlur, onFocus, placeholder, sanitized, ...props }: InputProps,
    ref: React.ForwardedRef<RNTextInput>,
  ) => {
    const colors = useColors();
    const startAdornmentAnimatedValue = React.useRef(new Animated.Value(!!props.value ? 1 : 0)).current;
    const [isFocussed, setIsFocussed] = React.useState<boolean>(false);
    const localTextInputRef = React.useRef<RNTextInput>(null);
    const focusAnimatedValue = React.useRef(new Animated.Value(0)).current;
    const [inputHeight, setInputHeight] = React.useState<number>(0);
    const [animatedLabelSize, setAnimatedLabelSize] = React.useState<{ width: number; height: number }>({
      width: 0,
      height: 0,
    });

    const inputContentTopSpacing = useMemo(() => {
      return animatedLabelSize.height - animatedLabelSize.height * scaleRange[1] * 0.9;
    }, [animatedLabelSize.height]);

    const translateYRange = useMemo(() => {
      const yPosition =
        (animatedLabelSize.height + inputHeight) / 2 - animatedLabelSize.height / 2 - inputContentTopSpacing / 2;
      const yFocusPosition = -(animatedLabelSize.height - animatedLabelSize.height * scaleRange[1]) / 2;

      return [yPosition, yFocusPosition];
    }, [animatedLabelSize, inputHeight, inputContentTopSpacing]);

    const translateXRange = useMemo(() => {
      const xPosition = -(animatedLabelSize.width - animatedLabelSize.width * scaleRange[1]) / 2;
      return [0, xPosition];
    }, [animatedLabelSize.width]);

    const onInputLayoutChange = useCallback((event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setInputHeight(height);
    }, []);

    const onLabelLayoutChange = useCallback((event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout;
      setAnimatedLabelSize({ width, height });
    }, []);

    const defaultSettings = useMemo(() => {
      return {
        multiline: false,
        placeholderTextColor: colors['grey.200'],
        underlineColorAndroid: colors.transparent,
      };
    }, [colors]);

    const { ...remainingProps } = props;

    const inputColors = useMemo(
      () => ({
        color: colors['text.primary'],
      }),
      [colors],
    );

    const onBlurInput = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (!props.value) {
        Animated.timing(startAdornmentAnimatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
      setIsFocussed(false);
      if (onBlur) {
        onBlur(e);
      }
    };

    const onFocusInput = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (!props.value) {
        Animated.timing(startAdornmentAnimatedValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          delay: 200,
        }).start();
      }
      setIsFocussed(true);
      if (onFocus) {
        onFocus(e);
      }
    };

    useEffect(() => {
      Animated.timing(focusAnimatedValue, {
        toValue: isFocussed || props.value || placeholder ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocussed, props?.value, placeholder]);

    const onHideKeyboard = useCallback(() => {
      setIsFocussed(false);
      localTextInputRef.current?.blur();
    }, []);

    useEffect(() => {
      if (hideKeyboardOnBlur) {
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', onHideKeyboard);
        return () => keyboardDidHideListener.remove();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hideKeyboardOnBlur]);

    const CustomInput = props.mask ? TextInputMask : AnimatedTextInput;

    return (
      <View style={[styles.wrapper, props?.containerStyle]}>
        <View
          style={[
            styles.relativeContainer,

            {
              backgroundColor: props.backgroundColor ? colors[props.backgroundColor] : colors['background.default'],
              borderColor: error ? colors['error.main'] : colors['grey.300'],
            },
            !label ? styles.noLabelContainer : null,
            props.wrapperStyle,
          ]}
        >
          <View style={styles.inputContentWrapper}>
            {label ? (
              <Animated.Text
                onLayout={onLabelLayoutChange}
                onPress={() => localTextInputRef.current?.focus()}
                style={[
                  styles.label,
                  {
                    color:
                      isFocussed || (props?.value && props?.value?.length > 0) || placeholder
                        ? props.labelColor
                          ? colors?.[props.labelColor]
                          : colors['text.primary']
                        : colors['grey.200'],
                  },
                  {
                    transform: [
                      {
                        translateY: focusAnimatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: translateYRange,
                        }),
                      },
                      {
                        translateX: focusAnimatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: translateXRange,
                        }),
                      },
                      {
                        scale: focusAnimatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: scaleRange,
                        }),
                      },
                    ],
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Animated.Text>
            ) : null}
            <View
              style={[
                styles.container,
                props.multiline ? styles.multilineContainer : styles.singlelineContainer,
                label ? { marginTop: -inputContentTopSpacing } : null,
              ]}
            >
              <View style={styles.inputWrapper}>
                {props.startAdornment ? (
                  <Animated.Text
                    style={[
                      styles.startAdornment,
                      {
                        opacity: startAdornmentAnimatedValue,
                        transform: [
                          {
                            translateX: startAdornmentAnimatedValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-10, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {props.startAdornment}
                  </Animated.Text>
                ) : null}
                <CustomInput
                  blurOnSubmit
                  onBlur={onBlurInput}
                  {...defaultSettings}
                  // @ts-expect-error -- multiRef
                  refInput={(r) => (localTextInputRef.current = r)}
                  type={'custom'}
                  {...remainingProps}
                  ref={(node) => {
                    if (ref) {
                      // @ts-expect-error -- multiRef
                      ref.current = node;
                    }
                    if (!props.mask) {
                      // @ts-expect-error -- multiRef
                      localTextInputRef.current = node;
                    }
                  }}
                  onFocus={onFocusInput}
                  style={[
                    isFocussed ? styles.focusStyle : styles.blurStyle,
                    styles.input,
                    inputColors,
                    props.multiline ? styles.multiline : {},
                    style || {},
                    props.inputStyle,
                  ]}
                  {...props}
                  editable={!props.loading}
                  onChangeText={(value: string) => {
                    if (sanitized) {
                      props?.onChangeText?.(
                        value
                          ?.trimStart()
                          ?.replace(/(\s\s+)/g, ' ')
                          ?.replace(/[<>]/gi, '') || '',
                      );
                    } else {
                      props?.onChangeText?.(value);
                    }
                  }}
                  onLayout={onInputLayoutChange}
                  placeholder={placeholder}
                  placeholderTextColor={colors['grey.200']}
                />
              </View>
            </View>
          </View>
          {/* <View style={styles.loaderContainer}> */}
          {props.loading ? (
            <ActivityIndicator size={20} color={colors['primary.main']} />
          ) : props?.endComponent ? (
            props?.endComponent
          ) : null}
          {/* </View> */}
        </View>
        {error ? (
          <View style={styles.error}>
            <Text color="error.main">{typeof error === 'string' ? capitalize(error as string) : error}</Text>
          </View>
        ) : null}
      </View>
    );
  },
);

export default Input;

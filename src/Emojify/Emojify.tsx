import React from 'react'
import { emojify } from './emojify'

export const Emojify = ({ children }: { children: string }) => emojify(children)

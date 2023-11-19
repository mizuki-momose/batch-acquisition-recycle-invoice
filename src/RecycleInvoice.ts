import { Parser } from '@json2csv/plainjs';
import Encoding from 'encoding-japanese';
import { z } from 'zod';

const recycleSchemaBase = z.object({
  carClass: z.union([z.literal('1'), z.literal('2')]),
  vinNumberClass: z.union([z.literal('1'), z.literal('2')]),
  vinNumber: z
    .string()
    .regex(new RegExp('^[0-9A-Z\\-]{1,42}$'), '英数字およびハイフン(-)で入力してください')
    .optional()
    .or(z.literal('')),
  oficialStampCharacter: z.string().length(1, '1文字で入力してください').optional(),
  oficialStampNumber: z
    .string()
    .regex(new RegExp('^[0-9]{7}$'), '数字のみ7文字で入力してください')
    .optional()
    .or(z.literal('')),
  searchClass: z.union([z.literal('1'), z.literal('2')]),
  branchOfficeName: z.string().min(1, '1~4文字で入力してください').max(4, '1~4文字で入力してください').optional(),
  carClassNumber: z
    .string()
    .regex(new RegExp('^[0-9A-Z]{1,3}$'), '英数字1~3文字で入力してください')
    .optional()
    .or(z.literal('')),
  kanaCode: z
    .string()
    .regex(new RegExp('^[Ａ-Ｚあ-ん]{1}$'), 'ひらがなおよび英字のみ1文字で入力してください')
    .optional()
    .or(z.literal('')),
  identificationNumber: z
    .string()
    .regex(new RegExp('^[0-9]{1,4}$'), '数字のみ1~4文字で入力してください')
    .optional()
    .or(z.literal('')),
  recycleNumber: z
    .string()
    .regex(new RegExp('^[0-9]{12}$'), '数字のみ12文字で入力してください')
    .optional()
    .or(z.literal('')),
});

export const recycleSchema = recycleSchemaBase.superRefine((v, ctx) => {
  const requiredIssue = (path: string) =>
    ctx.addIssue({ path: [path], message: '入力必須', code: z.ZodIssueCode.custom });

  if (v.vinNumberClass === '1') {
    !!v.vinNumber || requiredIssue('vinNumber');
  } else if (v.vinNumberClass === '2') {
    !!v.oficialStampCharacter || requiredIssue('oficialStampCharacter');
    !!v.oficialStampNumber || requiredIssue('oficialStampNumber');
  }

  if (v.searchClass === '1') {
    !!v.branchOfficeName || requiredIssue('branchOfficeName');
    !!v.carClassNumber || requiredIssue('carClassNumber');
    !!v.kanaCode || requiredIssue('kanaCode');
    !!v.identificationNumber || requiredIssue('identificationNumber');
  } else if (v.searchClass === '2') {
    !!v.recycleNumber || requiredIssue('recycleNumber');
  }
});

export const recycleArraySchema = z.object({ recycles: recycleSchema.array() });

export type RecycleSchema = z.infer<typeof recycleSchema>;
export type RecycleArraySchema = z.infer<typeof recycleArraySchema>;

export const getRecycleCsv = (recycleData: RecycleSchema[]) => {
  const parser = new Parser({ fields: Object.keys(recycleSchemaBase.shape), header: false });
  const csv = parser.parse(recycleData);
  const unicordList = Encoding.stringToCode(csv.replace(/"/g, ''));
  const sjisCodeList = Encoding.convert(unicordList, 'SJIS', 'UNICODE');
  const u8a = new Uint8Array(sjisCodeList);
  return new Blob([u8a], { type: 'text/csv' });
};

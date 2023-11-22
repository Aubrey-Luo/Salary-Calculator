/**
 * @description 税后薪资计算器插件 for Lark 多维表格
 * @author Aubrey-Luo
 * @phone +86 13799830665（同 Wechat、Lark）
 */

import { UIBuilder, FieldType } from "@lark-base-open/js-sdk";
import { UseTranslationResponse } from 'react-i18next';
import Salary from 'easy-salary';
import { cityConfig } from './constant';
import { IWidgetView, IWidgetTable } from '@lark-base-open/web-api';

export default async function (uiBuilder: UIBuilder, { t }: UseTranslationResponse<'translation', undefined>) {
  // 导入城市数据，并作为表单选项
  const cityConfigArray: any[] = [];
  for (const [key, obj] of Object.entries(cityConfig)) {
    cityConfigArray.push({ label: t(obj?.name), value: key });
  }
  uiBuilder.markdown(`> ${t('通过月工资、年终奖、社保基数、专项附加扣除批量计算税后薪资（包括税前税后总收入及个人所得税），已录入 2023 最新城市数据')} 👉 [${t('插件使用指南')}](https://hyl2646ps4.feishu.cn/docx/RIHfdMxOOolvbIxrCbEcXHbsnyb)`);
  uiBuilder.form((form) => ({
    formItems: [
      form.select('city', {
        label: t('城市'), options: cityConfigArray as any[], defaultValue: 'BeiJing'
      }),
      form.tableSelect('table', { label: t('选择数据表') }),
      form.viewSelect('view', { label: t('选择视图'), sourceTable: 'table' }),
      form.fieldSelect('base', { label: t('月工资（必填）'), sourceTable: 'table', filterByTypes: [FieldType.Number] }),
      form.fieldSelect('months', { label: t('年终奖月数（默认为 0）'), sourceTable: 'table', filterByTypes: [FieldType.Number] }),
      form.fieldSelect('insurance', { label: t('五险一金基数（默认为月工资）'), sourceTable: 'table', filterByTypes: [FieldType.Number] }),
      form.fieldSelect('addition', { label: t('专项附加扣除（租房/养老 etc. 详见个税 APP）'), sourceTable: 'table', filterByTypes: [FieldType.Number] })
    ],
    buttons: [t('计算')],
  }), async ({ key, values }) => {
    if (key !== t('计算')) return;

    // Set Loading
    uiBuilder.showLoading(t('计算中'));

    const table = values.table as IWidgetTable;
    const view = values.view as IWidgetView;
    const city = values.city as keyof typeof cityConfig;
    const { base, months, insurance, addition } = values as any;

    // 公积金基数上下限、失业险个人缴纳比例（根据城市不同有所差异）
    const { fundMin, fundMax, unemploymentInsurance } = cityConfig[city];

    // 字段检验（月工资必填）
    if (!table || !view || !base) {
      uiBuilder.message.error(t('请先选择字段，视图及月工资为必填字段！'));
      uiBuilder.hideLoading();
      return;
    }

    // 拿到当前视图下的可见 records
    const records: any = await view.getVisibleRecordIdList();

    // 封装函数：拿到结果字段，若没有对应字段则创建并 return
    async function getFieldIdByName(table: any, fieldName: string) {
      try {
        const field = await table.getFieldByName(fieldName);
        return field?.id;
      } catch {
        const newField = await table.addField({
          type: FieldType.Number,
          property: {
            formatter: "0.00"
          },
          name: fieldName,
        });
        return newField;
      }
    }

    // 执行获取结果字段的函数
    const totalSalaryPreTaxFieldId = await getFieldIdByName(table, '年总税前收入');
    const totalSalaryAfterTaxFieldId = await getFieldIdByName(table, '年总税后收入');
    const salaryAfterTaxAvgFieldId = await getFieldIdByName(table, '月平均税后收入');
    const salaryTotalTaxFieldId = await getFieldIdByName(table, '年总个人所得税');

    // 计算结果并填入结果字段
    for (const recordId of records) {
      const baseNum = await table.getCellValue(base.id, recordId) as number;
      const monthsNum = months ? await table.getCellValue(months.id, recordId) : 0;
      const insuranceNum = insurance ? await table.getCellValue(insurance.id, recordId) : baseNum;
      const additionNum = addition ? await table.getCellValue(addition.id, recordId) : 0;
      const result = (new Salary({
        salary: baseNum as number, // 月工资
        yearEndAwardsNumber: monthsNum as number, // 年终奖月数
        insuranceAndFundBase: insuranceNum as number, // 五险一金基数
        specialAdditionalDeduction: additionNum as number, // 专项附加扣除
        startingSalary: 5000, // 个税起征点（根据政策都为 5000）
        housingFundRange: { // 公积金上下限
          min: fundMin,
          max: fundMax
        },
        insuranceAndFundRate: {
          pension: 0.08, // 养老保险
          medicalInsurance: 0.02, // 医疗保险
          unemploymentInsurance: unemploymentInsurance, // 失业保险
          injuryInsurance: 0, // 工伤保险
          maternityInsurance: 0, // 生育保险
          housingFund: 0.07, // 住房公积金
          supplementaryFund: 0.05, // 补充住房公积金
        },
      })).calculate();
      await table.setCellValue(totalSalaryPreTaxFieldId, recordId, result?.totalSalaryPreTax);
      await table.setCellValue(totalSalaryAfterTaxFieldId, recordId, result?.totalSalaryAfterTax);
      await table.setCellValue(salaryAfterTaxAvgFieldId, recordId, result?.salaryAfterTaxAvg);
      await table.setCellValue(salaryTotalTaxFieldId, recordId, result?.salaryTotalTax);
    }

    // Unset Loading
    uiBuilder.hideLoading();
  });
}
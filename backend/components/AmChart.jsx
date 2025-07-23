import React, { useLayoutEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

const AmChart = ({ id, title, type, data, categoryField, valueField }) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(id);
    root.setThemes([am5themes_Animated.new(root)]);

    let chart;

    if (type === 'bar' || type === 'line') {
      chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: false,
          wheelX: 'panX',
          wheelY: 'zoomX',
        })
      );

      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField,
          renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 }),
        })
      );
      xAxis.data.setAll(data);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {}),
        })
      );

      const series = chart.series.push(
        (type === 'bar' ? am5xy.ColumnSeries : am5xy.LineSeries).new(root, {
          name: title,
          xAxis,
          yAxis,
          valueYField: valueField,
          categoryXField: categoryField,
          tooltip: am5.Tooltip.new(root, {
            labelText: `{${categoryField}}: {${valueField}}`,
          }),
        })
      );

      series.data.setAll(data);

      // Curseur interactif
      chart.set('cursor', am5xy.XYCursor.new(root, {}));

      if (type === 'bar') {
        series.columns.template.setAll({
          fill: am5.color('#4d70eb'),
          stroke: am5.color('#4d70eb'),
        });
      }

      if (type === 'line') {
        // Ligne en bleu
        series.strokes.template.setAll({
          stroke: am5.color('#4d70eb'),
          strokeWidth: 2,
        });

        // Points (bullets)
        series.bullets.push(() => {
          return am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 5,
              fill: am5.color('#4d70eb'),
              stroke: am5.color('#fff'),
              strokeWidth: 2,
            }),
          });
        });
      }

      series.appear(1000);
      chart.appear(1000, 100);
    }

    if (type === 'pie' || type === 'doughnut') {
      chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          layout: root.verticalLayout,
          innerRadius: type === 'doughnut' ? am5.percent(50) : 0,
        })
      );

      const series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField,
          categoryField,
        })
      );

      series.data.setAll(data);

      // Couleur unique pour tout
      series.slices.template.setAll({
        fill: am5.color('#4d70eb'),
        stroke: am5.color('#4d70eb'),
      });

      series.appear(1000, 100);
    }

    return () => root.dispose();
  }, [id, type, data, categoryField, valueField, title]);

  return (
    <div
      style={{
        padding: '20px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          marginBottom: '20px',
          color: '#333',
          textAlign: 'center',
        }}
      >
        {title}
      </h2>
      <div id={id} style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
};

export default AmChart;

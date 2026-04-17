export const tradingEs: Record<string, { prompt: string; options?: string[]; correctAnswer?: string | string[] }> = {
  // Market Basics
  'What is a stock?': { prompt: "¿Qué es una acción?", options: ["Un tipo de bono", "Una participación de propiedad en una empresa", "Un préstamo gubernamental", "Una cuenta de ahorro"], correctAnswer: "Una participación de propiedad en una empresa" },
  'The stock market is open 24/7.': { prompt: "El mercado de valores está abierto 24/7.", options: ["Verdadero", "Falso"], correctAnswer: "Falso" },
  'What does NYSE stand for?': { prompt: "¿Qué significa NYSE?", options: ["New York Stock Exchange", "National Yield Stock Entity", "New Yield Securities Exchange", "North York Stock Exchange"], correctAnswer: "New York Stock Exchange" },
  'Buying low and selling high is the basic goal of ___.': { prompt: "Comprar bajo y vender alto es el objetivo básico del ___.", options: ["Trading", "Banca", "Préstamos", "Ahorro"], correctAnswer: "Trading" },
  "Investing money you can't afford to lose.": { prompt: "Invertir dinero que no puedes permitirte perder.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'What is a broker?': { prompt: "¿Qué es un bróker?", options: ["Una acción rota", "Un intermediario que ejecuta operaciones", "Un tipo de bono", "Un regulador del mercado"], correctAnswer: "Un intermediario que ejecuta operaciones" },
  'A dividend is a payment companies make to shareholders.': { prompt: "Un dividendo es un pago que las empresas hacen a los accionistas.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },

  // Bull vs Bear
  'What is a bull market?': { prompt: "¿Qué es un mercado alcista (bull market)?", options: ["Los precios bajan", "Los precios suben", "El mercado está cerrado", "El mercado está plano"], correctAnswer: "Los precios suben" },
  'A bear market means prices are going up.': { prompt: "Un mercado bajista (bear market) significa que los precios suben.", options: ["Verdadero", "Falso"], correctAnswer: "Falso" },
  'A ___ market is defined by a 20%+ decline from recent highs.': { prompt: "Un mercado ___ se define por una caída del 20%+ desde máximos recientes.", options: ["Bajista", "Alcista", "Plano", "Muerto"], correctAnswer: "Bajista" },
  'Panic selling when the market drops 5%.': { prompt: "Vender en pánico cuando el mercado cae un 5%.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'What does "bearish" mean?': { prompt: '¿Qué significa "bearish"?', options: ["Esperar que los precios suban", "Esperar que los precios bajen", "Perspectiva neutral", "Querer comprar"], correctAnswer: "Esperar que los precios bajen" },
  'Bear markets typically last longer than bull markets.': { prompt: "Los mercados alcistas generalmente duran más que los bajistas.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'Which trading mindset is better?': { prompt: "¿Qué mentalidad de trading es mejor?", options: ["¡El mercado se desploma! ¡Vender todo ahora!", "El mercado está bajando — déjame revisar mi estrategia y fundamentos."], correctAnswer: "El mercado está bajando — déjame revisar mi estrategia y fundamentos." },

  // Chart Reading
  'What does the X-axis usually show on a stock chart?': { prompt: "¿Qué muestra generalmente el eje X en un gráfico bursátil?", options: ["Precio", "Volumen", "Tiempo", "Beneficio"], correctAnswer: "Tiempo" },
  'A line chart connects closing prices over time.': { prompt: "Un gráfico de líneas conecta los precios de cierre a lo largo del tiempo.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'What does the Y-axis show on a price chart?': { prompt: "¿Qué muestra el eje Y en un gráfico de precios?", options: ["Tiempo", "Precio", "Volumen", "Noticias"], correctAnswer: "Precio" },
  'A ___ chart uses colored bars to show open, high, low, close.': { prompt: "Un gráfico de ___ usa barras de colores para mostrar apertura, máximo, mínimo y cierre.", options: ["Velas", "Pastel", "Dispersión", "Puntos"], correctAnswer: "Velas" },
  'Making decisions based on a single chart timeframe.': { prompt: "Tomar decisiones basadas en un solo marco temporal.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'What timeframe is best for day trading charts?': { prompt: "¿Qué marco temporal es mejor para gráficos de day trading?", options: ["Mensual", "Semanal", "1 minuto a 15 minutos", "Anual"], correctAnswer: "1 minuto a 15 minutos" },
  'Volume bars appear above the price chart typically.': { prompt: "Las barras de volumen aparecen típicamente debajo del gráfico de precios.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },

  // Candlesticks
  'What does a green/white candle mean?': { prompt: "¿Qué significa una vela verde/blanca?", options: ["El precio bajó", "El precio subió", "El mercado cerró", "Sin operaciones"], correctAnswer: "El precio subió" },
  'A red/black candle means the price closed higher than it opened.': { prompt: "Una vela roja/negra significa que el precio cerró más bajo de lo que abrió.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'The thin lines above and below a candle are called ___.': { prompt: "Las líneas finas arriba y abajo de una vela se llaman ___.", options: ["Mechas", "Tallos", "Líneas", "Barras"], correctAnswer: "Mechas" },
  'What is a "doji" candle?': { prompt: '¿Qué es una vela "doji"?', options: ["Una vela muy alta", "Una vela donde la apertura y el cierre son casi iguales", "Una vela sin mecha", "Una vela de fiesta"], correctAnswer: "Una vela donde la apertura y el cierre son casi iguales" },
  'Using a single candlestick to predict the entire market.': { prompt: "Usar una sola vela para predecir todo el mercado.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'What does a long lower wick suggest?': { prompt: "¿Qué sugiere una mecha inferior larga?", options: ["Venta fuerte", "Los compradores empujaron el precio hacia arriba", "El mercado está cerrado", "Sin interés"], correctAnswer: "Los compradores empujaron el precio hacia arriba" },
  'A "hammer" candle has a small body and long lower wick.': { prompt: 'Una vela "martillo" tiene un cuerpo pequeño y una mecha inferior larga.', options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },

  // Support & Resistance
  'What is a support level?': { prompt: "¿Qué es un nivel de soporte?", options: ["Donde el precio tiende a dejar de caer", "Donde el precio siempre sube", "El precio más alto jamás alcanzado", "Un piso de precio gubernamental"], correctAnswer: "Donde el precio tiende a dejar de caer" },
  'Resistance is a price level where selling pressure tends to emerge.': { prompt: "La resistencia es un nivel de precio donde la presión de venta tiende a aparecer.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'When price breaks through resistance, it often becomes new ___.': { prompt: "Cuando el precio rompe la resistencia, a menudo se convierte en nuevo ___.", options: ["Soporte", "Resistencia", "Volumen", "Tendencia"], correctAnswer: "Soporte" },
  'How do you identify support levels?': { prompt: "¿Cómo se identifican los niveles de soporte?", options: ["Al azar", "Buscar el precio rebotando en el mismo nivel varias veces", "Preguntar a un amigo", "Ver las noticias"], correctAnswer: "Buscar el precio rebotando en el mismo nivel varias veces" },
  'Buying right at resistance without confirmation.': { prompt: "Comprar justo en la resistencia sin confirmación.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'Support and resistance levels are exact prices, never zones.': { prompt: "Los niveles de soporte y resistencia son precios exactos, nunca zonas.", options: ["Verdadero", "Falso"], correctAnswer: "Falso" },
  'Which approach to support/resistance is better?': { prompt: "¿Qué enfoque de soporte/resistencia es mejor?", options: ["El soporte es exactamente $50.00, compraré a ese centavo.", "La zona de soporte está alrededor de $49.50-$50.50, esperaré confirmación."], correctAnswer: "La zona de soporte está alrededor de $49.50-$50.50, esperaré confirmación." },

  // Volume Analysis
  'What does volume measure?': { prompt: "¿Qué mide el volumen?", options: ["Cambio de precio", "Número de acciones negociadas", "Beneficio de la empresa", "Horario del mercado"], correctAnswer: "Número de acciones negociadas" },
  "High volume confirms a price move's strength.": { prompt: "Un volumen alto confirma la fuerza de un movimiento de precio.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'A price rise on low volume may indicate a ___ move.': { prompt: "Una subida de precio con bajo volumen puede indicar un movimiento ___.", options: ["Débil", "Fuerte", "Rápido", "Permanente"], correctAnswer: "Débil" },
  'Ignoring volume when analyzing a breakout.': { prompt: "Ignorar el volumen al analizar una ruptura.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'What does a volume spike usually indicate?': { prompt: "¿Qué indica generalmente un pico de volumen?", options: ["Nada importante", "Mayor interés o un evento significativo", "El mercado está cerrando", "Un error"], correctAnswer: "Mayor interés o un evento significativo" },
  "Average volume helps compare today's activity to normal levels.": { prompt: "El volumen promedio ayuda a comparar la actividad del día con niveles normales.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },

  // Moving Averages
  'What is a moving average?': { prompt: "¿Qué es una media móvil?", options: ["El precio más alto", "El precio promedio en un período determinado", "El precio predicho de mañana", "El precio de apertura"], correctAnswer: "El precio promedio en un período determinado" },
  'The 200-day moving average is commonly used for intraday trading.': { prompt: "La media móvil de 200 días se usa comúnmente para tendencias a largo plazo.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'A "golden cross" occurs when the 50-day MA crosses ___ the 200-day MA.': { prompt: 'Un "golden cross" ocurre cuando la MM de 50 días cruza ___ la MM de 200 días.', options: ["Por encima de", "Por debajo de", "A través de", "Alrededor de"], correctAnswer: "Por encima de" },
  'What is a "death cross"?': { prompt: '¿Qué es un "death cross"?', options: ["Cuando una acción llega a $0", "Cuando la MM de 50 días cruza por debajo de la MM de 200 días", "Cuando el mercado cierra", "Un tipo de vela"], correctAnswer: "Cuando la MM de 50 días cruza por debajo de la MM de 200 días" },
  'Using moving averages as the only indicator for trades.': { prompt: "Usar medias móviles como único indicador para operaciones.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'An SMA reacts faster to price changes than an EMA.': { prompt: "Una EMA reacciona más rápido a los cambios de precio que una SMA.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'What does SMA stand for?': { prompt: "¿Qué significa SMA?", options: ["Stock Market Average", "Simple Moving Average", "Standard Market Analysis", "Short-term Moving Asset"], correctAnswer: "Simple Moving Average" },

  // Risk Management
  'What is a stop-loss order?': { prompt: "¿Qué es una orden de stop-loss?", options: ["Una orden para comprar más", "Una orden que vende cuando el precio alcanza un mínimo establecido", "Un límite en las horas de trading", "Una comisión del bróker"], correctAnswer: "Una orden que vende cuando el precio alcanza un mínimo establecido" },
  'You should risk no more than 1-2% of your account on one trade.': { prompt: "No deberías arriesgar más del 1-2% de tu cuenta en una sola operación.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
  'The risk-to-___ ratio compares potential loss to potential gain.': { prompt: "La relación riesgo-___ compara la pérdida potencial con la ganancia potencial.", options: ["Recompensa", "Retorno", "Ingresos", "Tasa"], correctAnswer: "Recompensa" },
  'Putting all your money into one stock.': { prompt: "Poner todo tu dinero en una sola acción.", options: ["Buena práctica", "Mala práctica"], correctAnswer: "Mala práctica" },
  'What is diversification?': { prompt: "¿Qué es la diversificación?", options: ["Comprar una sola acción", "Distribuir inversiones entre diferentes activos", "Vender todo", "Day trading"], correctAnswer: "Distribuir inversiones entre diferentes activos" },
  'Which risk approach is better?': { prompt: "¿Qué enfoque de riesgo es mejor?", options: ["¡Me siento con suerte, voy con todo en este dato!", "Arriesgaré el 2% de mi cuenta y pondré un stop-loss."], correctAnswer: "Arriesgaré el 2% de mi cuenta y pondré un stop-loss." },
  'Position sizing means deciding how much to invest in each trade.': { prompt: "El dimensionamiento de posición significa decidir cuánto invertir en cada operación.", options: ["Verdadero", "Falso"], correctAnswer: "Verdadero" },
};

export default tradingEs;

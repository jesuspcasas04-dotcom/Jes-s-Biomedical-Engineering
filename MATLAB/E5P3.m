% Definir los coeficientes del filtro basado en la ecuación dada
b = [1]; % Coeficiente de x[n]
a = [1 -1 0.9]; % Coeficientes de y[n], con a0 = 1

% Generación del impulso unitario δ[n] en el intervalo 0 ≤ n ≤ 100
n = 0:100;
impulso = (n == 0); % δ[n] = 1 en n=0, 0 en otro caso

% Aplicar el filtro para obtener la respuesta al impulso h[n]
h = filter(b, a, impulso);

% Graficar la respuesta al impulso
figure;
stem(n, h, 'filled');
title('Respuesta al impulso h[n]');
xlabel('n');
ylabel('h[n]');
grid on;

% Evaluación de la estabilidad: El sistema es estable si h[n] tiende a 0
disp('Comprobación de estabilidad: si h[n] -> 0 para n grande, el sistema es estable.');

% Coeficientes del sistema basado en la ecuación en diferencias dada
b = [1 2 1]; % Coeficientes de x[n]
a = [1 -0.5 0.25]; % Coeficientes de y[n]

% Definición del intervalo
n = 0:200;

% Generar la entrada x[n] = 5 + 3cos(0.2πn) + 4sin(0.6πn)u[n]
x = 5 + 3*cos(0.2*pi*n) + 4*sin(0.6*pi*n); % Escalón implícito ya que n ≥ 0

% Opción 1: Aplicar el filtro directamente con la función filter
y_filter = filter(b, a, x);

% Opción 2: Calcular la respuesta con la convolución usando la respuesta al impulso h[n]
y_conv = conv(x, h);
y_conv = y_conv(1:length(n)); % Ajustar la longitud de y_conv al intervalo

% Graficar los resultados
figure;
subplot(2,1,1);
stem(n, y_filter, 'filled');
title('Respuesta y[n] usando filter');
xlabel('n');
ylabel('y[n]');
grid on;

subplot(2,1,2);
stem(n, y_conv, 'filled');
title('Respuesta y[n] usando convolución con h[n]');
xlabel('n');
ylabel('y[n]');
grid on;

% Comparación
disp('Comparación de y[n] obtenida con filter y con convolución:');
error = norm(y_filter - y_conv);
disp(['Error entre métodos: ', num2str(error)]);

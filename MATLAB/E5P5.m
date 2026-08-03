% Ejercicio 5 - Diseño manual de filtro FIR pasa bajos sin toolboxes

% Paso 1: Crear sinc manual + ventana Hamming
orden = 51;
fc = 0.3;
M = orden;
n = 0:M;
n_centered = n - M/2;

% Implementación de sinc(x) manual: sinc(x) = sin(pi*x)/(pi*x)
sinc_manual = zeros(size(n_centered));
for i = 1:length(n_centered)
    if n_centered(i) == 0
        sinc_manual(i) = 1;
    else
        sinc_manual(i) = sin(pi * 2 * fc * n_centered(i)) / (pi * 2 * fc * n_centered(i));
    end
end

hd = 2 * fc * sinc_manual;

% Ventana de Hamming manual
w_hamming = 0.54 - 0.46 * cos(2*pi*n / M);

% Coeficientes del filtro FIR
b = hd .* w_hamming;
a = 1;

% Paso 2: Crear señal con dos frecuencias
N = 500;
n_sig = 0:N-1;
f1 = 0.2;  % Dentro del paso del filtro
f2 = 0.4;  % Fuera del paso del filtro

x = sin(2*pi*f1*n_sig) + sin(2*pi*f2*n_sig);

% Paso 3: Aplicar el filtro
y = filter(b, a, x);

% Paso 4a: Representar señales en el tiempo
figure;
subplot(2,1,1); plot(n_sig, x); title('Señal original');
xlabel('n'); ylabel('Amplitud');

subplot(2,1,2); plot(n_sig, y); title('Señal filtrada');
xlabel('n'); ylabel('Amplitud');

% Paso 4b: Análisis en frecuencia
X = abs(fftshift(fft(x)));
Y = abs(fftshift(fft(y)));
f = linspace(-0.5, 0.5, N);

figure;
subplot(2,1,1); plot(f, X); title('Espectro de la señal original');
xlabel('Frecuencia normalizada'); ylabel('Magnitud');

subplot(2,1,2); plot(f, Y); title('Espectro de la señal filtrada');
xlabel('Frecuencia normalizada'); ylabel('Magnitud');


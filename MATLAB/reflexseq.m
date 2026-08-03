function [y, n] = reflexseq(x, n)
    % Refleja la secuencia x en el eje temporal
    n = -n(end:-1:1); % Invierte el orden de los índices y cambia el signo
    y = x(end:-1:1); % Invierte el orden de los valores de la secuencia
end
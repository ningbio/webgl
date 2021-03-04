var WebGL = function(canvas)
{
    const gl = canvas.getContext("webgl2");

    //  Access WebGL context
    this.context = function()
    {
        return gl;
    };

    // Create GLSL program from given sources, compile and link
    this.createProgram = function(vertexProgram, fragmentProgram)
    {
        const vs = gl.createShader(gl.VERTEX_SHADER);
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        const program = gl.createProgram();

        compile(vs, vertexProgram);
        compile(fs, fragmentProgram);

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(program));
        }

        return program;
    };

    // Create texture from the given image source URL
    this.createTexture = function(src)
    {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        const image = new Image();
        image.src = src;
        image.onload = function()
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
            gl.generateMipmap(gl.TEXTURE_2D);
        };

        return texture;
    };

    // Create vertex buffer with the given topology and vertex attributes
    this.createBuffer = function(data, topology, attributes)
    {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        buffer.topology = topology;
        buffer.attributes = attributes;
        buffer.count = data.length / valuesPerVertex(attributes);

        return buffer;
    }

    // Draw geometry from the given buffer with the given GLSL program
    this.drawArrays = function(program, buffer)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        const stride = valuesPerVertex(buffer.attributes) * Float32Array.BYTES_PER_ELEMENT;
        let offset = 0;

        for(const name in buffer.attributes)
        {
            const size = buffer.attributes[name];
            const location = gl.getAttribLocation(program, name);

            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);

            offset += size * Float32Array.BYTES_PER_ELEMENT;
        }

        gl.drawArrays(buffer.topology, 0, buffer.count);
    };

    // Rendering callback wrapper with binding to WebGL class instance
    this.draw = function(callback)
    {
        callback = callback.bind(this);

        const draw = function(timestamp)
        {
            callback(timestamp);
            window.requestAnimationFrame(draw);
        };

        window.requestAnimationFrame(draw);
    };

    // Count quantity of values of a single vertex
    function valuesPerVertex(attributes)
    {
        let values = 0;

        for(const name in attributes)
        {
            values += attributes[name];
        }

        return values;
    }

    // Compile the given shader and check for errors
    function compile(shader, source)
    {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(shader));
        }
    }
}
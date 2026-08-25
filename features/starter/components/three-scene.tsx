"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Lightweight Three.js background: a slowly drifting particle field with
 * depth-based opacity. Reads the `--primary` CSS variable so the scene
 * follows theme tokens (light/dark/presets) without hardcoded colors.
 *
 * Performance notes:
 * - Single Points geometry, one draw call, ~600 particles.
 * - Pauses rendering when the tab is hidden or reduced motion is preferred
 *   (parent checks reduced motion too — this is a second safety net).
 * - Cleans up geometries/materials/renderer on unmount.
 */
export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    } catch {
      // WebGL unavailable (or blocked) — leave the background empty.
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Read the token color once; fall back to a neutral mid-gray if unset.
    const tokenColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() || "#71717a";

    const COUNT = 600;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(tokenColor),
      size: 0.06,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    let frameId = 0;
    let running = true;
    const clock = new THREE.Clock();

    function tick() {
      if (!running) return;
      frameId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      if (!prefersReducedMotion) {
        points.rotation.y = t * 0.03;
        points.rotation.x = Math.sin(t * 0.1) * 0.05;
      }
      renderer.render(scene, camera);
    }
    tick();

    function onVisibility() {
      running = document.visibilityState === "visible";
      if (running) {
        clock.getDelta();
        tick();
      } else {
        cancelAnimationFrame(frameId);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
